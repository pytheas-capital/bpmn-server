import { Execution } from "./Execution";
import { ITEM_STATUS, IItem } from "../../";
import { IItemData } from "../../";
import { Element, Node } from '../elements';
import { Token } from "./Token";
declare class Item implements IItem {
    id: any;
    itemKey: string;
    element: Element;
    token: Token;
    seq: any;
    userId: any;
    startedAt: any;
    _endedAt: any;
    instanceId: any;
    input: {};
    output: {};
    vars: {};
    assignee: any;
    candidateGroups: any;
    candidateUsers: any;
    dueDate: any;
    followUpDate: any;
    priority: any;
    get endedAt(): any;
    set endedAt(val: any);
    _status: ITEM_STATUS;
    get status(): ITEM_STATUS;
    set status(val: ITEM_STATUS);
    log(msg: any): void;
    get data(): any;
    set data(val: any);
    setData(val: any): void;
    get context(): import("../interfaces/engine").IExecution;
    get elementId(): any;
    get name(): any;
    get tokenId(): any;
    get type(): any;
    get node(): Node;
    timeDue: Date;
    timerCount: any;
    messageId: any;
    signalId: any;
    _dbAction: 'add' | 'update' | null;
    constructor(element: any, token: any, status?: ITEM_STATUS);
    save(): IItemData;
    static load(execution: Execution, dataObject: IItemData, token: any): Item;
}
export { Item };
