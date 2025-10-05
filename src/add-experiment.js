class AddExperiment {
    constructor(workflow) {
        this.modal = null;
        this.statusDropdown = null;
        this.workflow = workflow;
    }

    open(addToColumn) {
        const modal = document.querySelector('.add-experiment-modal');
        const statusDropdown = modal.querySelector('#experiment-status');

        statusDropdown.innerHTML = '';

        this.workflow.workflowArray.forEach(workflow => {
            const option = document.createElement('option');
            option.dataset.id = workflow.id;
            option.value = workflow.name;
            option.textContent = workflow.name;
            statusDropdown.appendChild(option);

            if (addToColumn && addToColumn === workflow.id) {
                option.selected = true;
            }
        })

        modal.showModal();
    }

    close() {
        const modal = document.querySelector('.add-experiment-modal');
        const titleInput = modal.querySelector('#experiment-title');
        const description = modal.querySelector('textarea');

        titleInput.value = '';
        description.value = '';
        modal.close();
    }
}

export { AddExperiment };