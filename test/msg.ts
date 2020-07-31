class Message {

    msg : string;

    constructor() {
        this.msg = "none";
    }

    edit(msg : string) : void {
        this.msg = msg;
    }

    toString() : string {
        return this.msg;
    }

    get() : string {
        return this.msg;
    }
}

const msg = new Message();
Object.freeze(msg);

export default msg;

