import { Experiment } from './experiments.js';
import { Notifications } from './notification.js';

class AddExperiment {
    constructor(workflow, experiments, kanban) {
        this.workflow = workflow;
        this.experiments = experiments;
        this.kanban = kanban;
        this.modal = null;
        this.statusDropdown = null;
        this.notifications = new Notifications();
    }

    buildForm(expId, addToColumn) {
        const dialog = document.createElement('dialog');
        dialog.className = 'add-experiment-modal';

        const title = document.createElement('h2');
        title.className = 'modal-title';
        title.textContent = 'Add experiment to board';
        dialog.appendChild(title);

        const form = document.createElement('form');
        form.className = 'add-experiment-form';

        const titleLabel = document.createElement('label');
        titleLabel.setAttribute('for', 'experiment-title');
        titleLabel.textContent = 'Title';
        form.appendChild(titleLabel);

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.name = 'experiment-title';
        titleInput.id = 'experiment-title';
        titleInput.placeholder = 'Title of experiment...';
        form.appendChild(titleInput);

        const descLabel = document.createElement('label');
        descLabel.setAttribute('for', 'experiment-description');
        descLabel.textContent = 'Description';
        form.appendChild(descLabel);

        const descTextarea = document.createElement('textarea');
        descTextarea.name = 'experiment-description';
        descTextarea.id = 'experiment-description';
        descTextarea.placeholder = 'Description of experiment...';
        form.appendChild(descTextarea);

        const statusLabel = document.createElement('label');
        statusLabel.setAttribute('for', 'experiment-status');
        statusLabel.textContent = 'Status';
        form.appendChild(statusLabel);

        const statusSelect = document.createElement('select');
        statusSelect.name = 'experiment-status';
        statusSelect.id = 'experiment-status';
        form.appendChild(statusSelect);

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'add-experiment-form-submit button-primary';
        submitBtn.textContent = 'Add experiment';
        form.appendChild(submitBtn);

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'add-experiment-form-close';
        closeBtn.textContent = 'Close';
        form.appendChild(closeBtn);

        dialog.appendChild(form);

        this.workflow.workflowArray.forEach(workflow => {
            const option = document.createElement('option');
            option.dataset.id = workflow.id;
            option.value = workflow.name;
            option.textContent = workflow.name;
            statusSelect.appendChild(option);

            if (addToColumn && addToColumn === workflow.id) {
                option.selected = true;
            }
        })

        if (expId) {
            const experiment = this.experiments.experimentArray.find(experiment => experiment.id == expId);
            titleInput.value = experiment.title;
            descTextarea.value = experiment.description;
            submitBtn.className = 'edit-experiment-form-submit button-primary';
            submitBtn.textContent = 'Save experiment';
            submitBtn.dataset.id = expId;
            title.textContent = 'Edit experiment';

            const options = statusSelect.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].dataset.id === experiment.workflowId) {
                    options[i].selected = true;
                    break;
                }
            }
        }

        document.body.appendChild(dialog);
        this.bindEvents();
        return dialog;
    }

    bindEvents() {
        document.querySelector('.add-experiment-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('add-experiment-form-submit')) {
                this.handleAddExperiment(e);
            }
            if (e.target.classList.contains('edit-experiment-form-submit')) {
                this.handleEditExperiment(e);
            }
            if (e.target.classList.contains('add-experiment-form-close')) {
                this.close();
            }
        })
    }

    handleAddExperiment(e) {
        e.preventDefault();
        const modal = document.querySelector('.add-experiment-modal');
        const titleInput = modal.querySelector('#experiment-title');
        const descriptionInput = modal.querySelector('#experiment-description');
        const statusDropdown = modal.querySelector('#experiment-status');

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const workflow = statusDropdown.value;
        const workflowId = statusDropdown.selectedOptions[0].dataset.id;

        if (title && workflow) {
            const newExperiment = new Experiment(title, workflow, workflowId, description);
            this.experiments.experimentArray.push(newExperiment);

            const workflowObj = this.workflow.workflowArray.find(w => w.id === workflowId);
            if (workflowObj) {
                workflowObj.items.push(newExperiment.id);
                this.workflow.saveWorkflow();
            }

            this.experiments.saveExperiments();
            this.close();
            this.kanban.refreshKanban();
            this.notifications.show('Experiment added', 'success');
        }

        // Needs error messages on form
    }

    handleEditExperiment(e) {
        e.preventDefault();
        const modal = document.querySelector('.add-experiment-modal');
        const titleInput = modal.querySelector('#experiment-title');
        const descriptionInput = modal.querySelector('#experiment-description');
        const statusDropdown = modal.querySelector('#experiment-status');

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const workflow = statusDropdown.value;
        const workflowId = statusDropdown.selectedOptions[0].dataset.id;

        if (title && workflow) {
            const expToEdit = this.experiments.experimentArray.find(experiment => experiment.id === e.target.dataset.id);
            if (expToEdit) {
                const oldWorkflowId = expToEdit.workflowId;
                expToEdit.title = title;
                expToEdit.description = description;
                expToEdit.workflow = workflow;
                expToEdit.workflowId = workflowId;

                if (oldWorkflowId !== workflowId) {
                    // Remove from old workflow
                    const oldWorkflow = this.workflow.workflowArray.find(w => w.id === oldWorkflowId);
                    if (oldWorkflow) {
                        oldWorkflow.items = oldWorkflow.items.filter(id => id !== expToEdit.id);
                    }

                    // Add to new workflow
                    const newWorkflow = this.workflow.workflowArray.find(w => w.id === workflowId);
                    if (newWorkflow) {
                        newWorkflow.items.push(expToEdit.id);
                    }

                    this.workflow.saveWorkflow();
                }

                this.experiments.saveExperiments();
                this.close();
                this.kanban.refreshKanban();
                this.notifications.show('Experiment updated', 'success');
            }
        }
    }

    open(addToColumn) {
        const existingModal = document.querySelector('.add-experiment-modal');
        if (existingModal) {
            existingModal.remove();
        }

        this.modal = this.buildForm(null, addToColumn);
        this.modal.showModal();
    }

    edit(expId) {
        const existingModal = document.querySelector('.add-experiment-modal');
        if (existingModal) {
            existingModal.remove();
        }

        this.modal = this.buildForm(expId, null);
        this.modal.showModal();
    }

    close() {
        // const modal = document.querySelector('.add-experiment-modal');
        const titleInput = this.modal.querySelector('#experiment-title');
        const description = this.modal.querySelector('textarea');

        titleInput.value = '';
        description.value = '';
        this.modal.close();
        this.modal.remove();
    }
}

export { AddExperiment };