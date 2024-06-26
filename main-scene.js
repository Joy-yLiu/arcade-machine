import {defs} from './examples/common.js';

// Now everything is loaded from tiny-graphics.js and its helper files. An object "tiny" wraps its contents, along
// with "defs" for wrapping some additional utilities included in common.js.

// ******************** Before selecting which demo we want to display, we have to load its code. If this page is hosted
// on the internet, the demo's class can be injected right here by the server.
//
// In this case, it's not, so you'll instead Load demos from files in your directory and copy them into "defs."

import {ClawMachine}
                    from "./clawmachine.js";

Object.assign (defs,
    {ClawMachine}
);

// ******************** SELECT THE DEMO TO DISPLAY:

const main_scene        = ClawMachine;
const additional_scenes = [];

export {main_scene, additional_scenes, defs};
