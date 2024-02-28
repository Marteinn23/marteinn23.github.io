"use strict";
const url = "http://localhost:3000/api/v1/tunes";
const synth = new Tone.Synth().toDestination();
const keyboard = document.getElementById("keyboardDiv");
const record_button = document.getElementById("recordbtn");
const stop_button = document.getElementById("stopbtn");
const tune_selector = document.getElementById("tunesDrop");
const name_input = document.getElementById("recordName");

const keys = [
    "a",
    "w",
    "s",
    "e",
    "d",
    "f",
    "t",
    "g",
    "y",
    "h",
    "u",
    "j",
    "k",
    "o",
    "l",
    "p",
    ";",
];

let tune_array = [];
let recording = false;
let input_on = true;
let recording_start_time;

let tune = [];
let tune_note;

const playNote = async (note, duration = "8n", timing = 0) => {
    await Tone.start();
    synth.triggerAttackRelease(note, duration, timing);
    if (recording) {
        tune_note = {
            note: note,
            duration: duration,
            timing: (performance.now() - recording_start_time) / 1000,
        };
        tune.push(tune_note);
    }
};

const record = () => {
    recording = true;
    record_button.disabled = true;
    stop_button.disabled = false;
    recording_start_time = performance.now();
};

const stop_record = async () => {
    recording = false;
    stop_button.disabled = true;
    record_button.disabled = false;

    if (tune.length !== 0) {
        await axios.post(url, {
            id: 0,
            name: get_tune_name(),
            tune: tune,
        });
    }

    tune = [];
    tune_note = [];
    getAllTunes();
};

const get_tune_name = () => {
    if (name_input.value === "") {
        return "No-name Tune";
    } else {
        return name_input.value;
    }
};

const getAllTunes = async () => {
    try {
        const response = await axios.get(url);
        tune_array = [];
        tune_selector.innerHTML = "";

        //response.data is an array if the request was successful, so you could iterate through it a forEach loop.
        response.data.forEach((item) => {
            const opt = document.createElement("option");
            opt.label = item.name;
            opt.value = item.id;
            tune_array.push(item.tune);
            tune_selector.appendChild(opt);
        });
    } catch (error) {
        //When unsuccessful, print the error.
        console.log(error);
    }
    // This code is always executed, independent of whether the request succeeds or fails.
};

const playTune = () => {
    const song_index = tune_selector.selectedIndex;
    const now = Tone.now();
    tune_array.at(song_index).forEach((note) => {
        playNote(note.note, note.duration, now + note.timing);
    });
};

keyboard.addEventListener("mousedown", (button) => {
    const now = Tone.now();
    playNote(button.target.id, "8n", now);
});

window.onkeydown = (keypress) => {
    if (keys.includes(keypress.key) && input_on && !keypress.repeat) {
        const key_index = keys.indexOf(keypress.key);
        const now = Tone.now();
        playNote(keyboard.children[key_index].id, "8n", now);
    }
};

name_input.addEventListener("focusin", () => {
    input_on = false;
});
name_input.addEventListener("focusout", () => {
    input_on = true;
});

getAllTunes();
