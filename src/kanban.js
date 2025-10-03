class Kanban {
    constructor(experiments, workflow) {
        this.experiments = experiments;
        this.workflow = workflow;
        this.kanbanDiv = document.querySelector('.kanban-board');
        this.kanbanColumns = document.querySelectorAll('.kanban-column');
    }

    refreshKanban() {
        this.renderColumns();
        if (this.renderColumns()) {
            let exp = [];
            for (let i = 0; i < this.workflow.workflowArray.length; i++) {
                const statusName = this.workflow.workflowArray[i].name;
                const exp = this.experiments.experimentArray.filter(
                    experiment => experiment.workflow === statusName
                );

                const column = this.kanbanDiv.querySelector(
                    `.kanban-column[data-id="${this.workflow.workflowArray[i].id}"]`
                );

                if (column) {
                    exp.forEach(experiment => {
                        this.renderExperiments(experiment, column);
                    });
                }
            }
        }
    }

    renderColumns() {
        this.kanbanDiv.innerHTML = '';
        if (this.workflow.workflowArray.length === 0) {
            this.kanbanDiv.textContent = 'No workflow found';
            return false;
        }
        for (let i = 0; i < this.workflow.workflowArray.length; i++) {
            const div = document.createElement('div');
            div.classList.add('kanban-column');
            div.dataset.id = this.workflow.workflowArray[i].id;
            div.innerHTML = `
                <div class="kanban-column-title">
                    ${this.workflow.workflowArray[i].name}
                </div>
        `;
            this.kanbanDiv.appendChild(div);
        }
        return true;
    }

    renderExperiments(experiment, column) {
        const div = document.createElement('div');
        div.classList.add('experiment-card');
        div.dataset.id = experiment.id;
        div.innerHTML = `
            <div class="experiment-title">
                ${experiment.title}
            </div>
            <div class="experiment-status">
                ${experiment.workflow}
            </div>
        `;
        column.appendChild(div);
    }

    openAddExperimentModal() {
        const modal = document.querySelector('.add-experiment-modal');
        const statusDropdown = modal.querySelector('#experiment-status');

        statusDropdown.innerHTML = '';

        this.workflow.workflowArray.forEach(workflow => {
            const option = document.createElement('option');
            option.dataset.id = workflow.id;
            option.value = workflow.name;
            option.textContent = workflow.name;
            statusDropdown.appendChild(option);
        })

        modal.showModal();
    }

    closeAddExperimentModal() {
        const modal = document.querySelector('.add-experiment-modal');
        const titleInput = modal.querySelector('#experiment-title');

        titleInput.value = '';
        modal.close();
    }

    openSettingsModal() {
        const modal = document.querySelector('.kanban-settings-modal');
        modal.showModal();
    }
}

export { Kanban };