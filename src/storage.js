class Storage {
    constructor() {
        this.storageKey = 'myExperiments';
        this.experiments = [];
        this.loadExperiments;
    }

    saveNotes() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.experiments));
    }

    loadNotes() {
        const data = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        this.experiments = data.map(Note.fromJSON);
    }
}

export { Storage };