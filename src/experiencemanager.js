import { RedditManager } from "~redditmanager"

//singleton class that controls the entire app
export class ExperienceManager {

    constructor(props) {
        //initialize the world
        //create rooms and tiles visible

        //information about current floor and stuff
        this.redditmanager = new RedditManager({threadname: "r/memes"});
    };

    //use player pos to decide what to add and remove from the world
    update() {

        //give this to 'room being initialized'
        this.redditmanager.getNext(function(subs) {
            subs.forEach(function(item, index) {
                if (item.hasOwnProperty('preview')) {
                    //console.log(item.preview.images[0].source.url);
                }

            });
            //console.log(subs);
        });
    };

}
