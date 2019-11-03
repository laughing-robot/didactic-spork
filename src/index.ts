import { r } from "~reddit";
import { Submission } from "snoowrap";

function isSuitableSubmission(submission: Submission): boolean {
    return !submission.over_18 && submission.thumbnail_height !== null && submission.thumbnail_width !== null
        && submission.thumbnail.indexOf('://') >= 0;
}

function appendSubmissionToAssets(submission: Submission) {
    const assets = document.getElementsByTagName('a-assets')[0];
    const child = document.createElement("image");
    child.setAttribute("id", `#${submission.id}`)
    child.setAttribute("srcset", `${submission.thumbnail} ${submission.thumbnail_width}w, ${submission.url}`)
    assets.appendChild(child);
}

// r.then(r => r.getHot()).then(submissions =>
//     submissions.filter(isSuitableSubmission).forEach(appendSubmissionToAssets)
// ).catch(err => {
    
// })

document.addEventListener("DOMContentLoaded", () => {
    if (document.location.hostname === 'localhost') {
        document.getElementsByTagName('a-scene')[0].setAttribute('stats', '');
    }
}, false);
