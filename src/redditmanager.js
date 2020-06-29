import { r } from "~reddit"

export class RedditManager {

    constructor(redditProps) {
        this.curthread = "r/memes";
        this.r = r;
        this.sortBy = "hot";
    }

    setSub(sub) {
        this.curthread = thread;
    }

    fetchBy(obj) {
        switch (this.sortBy) {
            case "hot":
                return obj.getHot();
                break;
            case "top":
                return obj.getTop();
                break;
        }
    }

    getNext(callback) {
        r.then(r => this.fetchBy(r.getSubreddit(this.curthread))).then(submissions => {
        console.log(submissions);
        callback(submissions);
        });
    }

}
