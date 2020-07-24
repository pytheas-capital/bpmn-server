import { IDefinition } from '../interfaces/elements';
import { BPMNServer } from '../server/BPMNServer';
declare class Definition implements IDefinition {
    name: any;
    processes: Map<any, any>;
    rootElements: any;
    nodes: Map<any, any>;
    flows: any[];
    source: any;
    logger: any;
    server: any;
    moddle: any;
    constructor(name: string, source: string, server: BPMNServer);
    private loadProcess;
    load(): Promise<any>;
    getJson(): string;
    getDefinition(source: any, logger: any): Promise<any>;
    getStartNode(): any;
    getNodeById(id: any): any;
}
export { Definition };
