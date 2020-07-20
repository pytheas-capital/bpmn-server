
const BpmnModdle = require('bpmn-moddle');

//import { moddleOptions} from './js-bpmn-moddle';

//const moddleOptions = require('./js-bpmn-moddle.json');

import { Logger } from '../common/Logger';
import { Node, Flow , MessageFlow ,SubProcess , NodeLoader , Process } from '.'; 
import { BPMN_TYPE } from './NodeLoader';
import { IDefinition } from '../interfaces/elements';
import { BPMNServer } from '../server/BPMNServer';

const fs = require('fs');

//console.log(moddleOptions);


class Definition implements IDefinition{
    name;
    processes = new Map();
    rootElements;
    nodes = new Map();
    flows = [];
    source;
    logger;
    server;
    moddle;
    constructor(name:string,source:string,server:BPMNServer) {
        this.server = server;
        this.name = name;
        this.source = source;
        this.logger = server.logger;

        const moddleOptions = this.server.appDelegate.moddleOptions;

        this.moddle = new BpmnModdle({ moddleOptions });
    }
    private loadProcess(definition, processElement) {

        let processId = processElement.id;
        const children = [];
        // process flowElements i.e. nodes 
        processElement.flowElements.forEach(child => {
            //
            let el = definition.elementsById[child.id];
            let node;
            if (el.$type == 'bpmn:SubProcess') { // subprocess
                node = new SubProcess(el.id, processId, el.$type, el);

                node.childProcess = this.loadProcess(definition, el);
            }
            else {
                node = NodeLoader.loadNode(el, processId);

             }
            this.nodes.set(el.id, node);
            children.push(node);
        });
        return new Process(processElement, children);
    }
    async load() {

        let definition = await this.getDefinition(this.source, this.logger);

        await fs.writeFile('definition.txt', JSON.stringify(definition), function (err) {
            if (err) throw err;
        });

        definition.rootElement.rootElements.forEach(e => {
            switch (e.$type) {
                case 'bpmn:Process':    
                    {
                        const proc = this.loadProcess(definition, e);
                        this.processes.set(e.id, proc);
                    }
                    break;
            }
        });

        let refs = new Map();
        /*
references:         
    element                                 part 1
		    $type : "bpmn:SequenceFlow"
		    id : "flow_start_user"
	    property : "bpmn:sourceRef"
	    id : "event_start"
    element                                 part 2
		    $type : "bpmn:SequenceFlow"
		    id : "flow_start_user"
	    property : "bpmn:targetRef"
	    id : "user_task"

         */
        definition.references.forEach(ref => {
            if (ref.element.$type == 'bpmn:SequenceFlow') {
                //                this.log(`-ref  <${ref.element.id}> <${ref.element.$type}> <${ref.property}> ref to: <${ref.id}>`);
                let id, type, from, to;
                id = ref.element.id;
                type = ref.element.type;
                let flow = refs.get(id);
                if (!flow) {
                    flow = { id, type, from, to };
                    refs.set(id, flow);
                }
                flow.type = ref.element.$type;
                if (ref.property == 'bpmn:sourceRef') {
                    flow.from = ref.id;
                }
                else
                    flow.to = ref.id;
            }
            // 
            // get boundary events
            /*
    reference
        element
            $type : "bpmn:BoundaryEvent"
            id : "BoundaryEvent_0qdlc8p"
        property : "bpmn:attachedToRef"
        id : "user_task"
    
    
    element
    $type : "bpmn:MessageEventDefinition"
    property : "bpmn:messageRef"
    id : "newInvoice"
    
    
    element
    $type : "bpmn:SignalEventDefinition"
    id : "signalEventDef1"
    property : "bpmn:signalRef"
    id : "cancelAll"
    
             */
            if (ref.element.$type == "bpmn:BoundaryEvent") {
                const event = this.getNodeById(ref.element.id);
                const owner = this.getNodeById(ref.id);
                if (owner.type !== 'bpmn:SequenceFlow') {
                    event.attachedTo = owner;
                    owner.attachments.push(event);
                }
            }
            else if ((ref.element.$type == "bpmn:MessageEventDefinition")
                || (ref.element.$type == "bpmn:SignalEventDefinition")) {
                const eventDef = definition.elementsById[ref.element.id];
                eventDef[ref.property] = ref.id;
            }
        });
        refs.forEach(ref => {
            const fromNode = this.getNodeById(ref.from);
            const toNode = this.getNodeById(ref.to);
            const flow = new Flow(ref.id, ref.type, fromNode, toNode, definition.elementsById[ref.id]);
            this.flows.push(flow);
            fromNode.outbounds.push(flow);
            toNode.inbounds.push(flow)
        });
        // last step get messageFlows:
        //  root
        definition.rootElement.rootElements.forEach(e => {
            if (e.$type == 'bpmn:Collaboration') {
                if (e.messageFlows) {
                    e.messageFlows.forEach(mf => {
                        const fromNode=this.getNodeById(mf.sourceRef.id);
                        const toNode= this.getNodeById(mf.targetRef.id);
                        const flow = new MessageFlow(mf.id, mf.$type, fromNode,toNode,mf);
                        fromNode.outbounds.push(flow);
                        toNode.inbounds.push(flow)
                    });

                }

            }
        });
        return definition;
    }
    getJson() {
        const elements = [];
        
        const flows = [];
        const processes = [];
        this.processes.forEach(process => {
            processes.push({ id: process.id, name: process.name, isExecutable: process.isExecutable });
        });
        this.nodes.forEach(node => {
            let behaviours = [];
            node.behaviours.forEach(behav => {
                behaviours.push(behav.describe());});
            elements.push({ id: node.id, name: node.name, type: node.type, process: node.processId , def: node.def, description: node.describe() , behaviours });
        });

        this.flows.forEach(flow=> {
            flows.push({ id: flow.id, from: flow.from.id, to: flow.to.id, type: flow.type, description: flow.describe() });
        });

        return JSON.stringify({ root: this.rootElements, processes , elements, flows });
    }
    async getDefinition(source, logger) {

    const result = await this.moddle.fromXML(source);


    return result;
    }

    public getStartNode() {
        let start = null;
        this.processes.forEach(proc => {
            start = proc.getStartNode();
//            if (start)
//                return start;
        });
        return start;
    }
    public getNodeById(id) {
            return this.nodes.get(id);
    }


}
export { Definition }