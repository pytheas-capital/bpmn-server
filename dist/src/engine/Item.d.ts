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
    startedAt: any;
    _endedAt: any;
    get endedAt(): any;
    set endedAt(val: any);
    _status: ITEM_STATUS;
    get status(): ITEM_STATUS;
    set status(val: ITEM_STATUS);
    log(msg: any): void;
    get data(): any;
    set data(val: any);
    get context(): import("../interfaces/engine").IExecutionContext;
    get elementId(): any;
    get name(): any;
    get tokenId(): any;
    get type(): any;
    get node(): Node;
    timeDue: Date;
    messageId: any;
    signalId: any;
    _dbAction: 'add' | 'update' | null;
    constructor(element: any, token: any, status?: ITEM_STATUS);
    save(): IItemData;
    static load(execution: Execution, dataObject: IItemData, token: any): Item;
}
export { Item };
