class DragDropManager {
    constructor(config) {
        this.container = config.container;
        this.itemSelector = config.itemSelector;
        this.onReorder = config.onReorder;
        this.direction = config.direction || 'vertical';
        this.onDrop = config.onDrop || null;
        this.draggingItem = null;
    }

    init() {
        this.container.addEventListener('dragstart', (e) => this.dragStart(e));
        this.container.addEventListener('dragend', (e) => this.dragEnd(e));
        this.container.addEventListener('dragover', (e) => this.dragOver(e));
        this.container.addEventListener('dragleave', (e) => this.dragLeave(e));
        this.container.addEventListener('drop', (e) => this.drop(e));
    }

    dragStart(event) {
        const item = event.target.closest(this.itemSelector);
        if (item) {
            this.draggingItem = item;
            item.classList.add('dragging');
        }
    }

    dragEnd(event) {
        if (this.draggingItem) {
            this.draggingItem.classList.remove('dragging');
            this.container.querySelectorAll(this.itemSelector).forEach(item => {
                item.classList.remove('drop');
            });
            this.draggingItem = null;
            this.onReorder();
        }
    }

    dragOver(event) {
        event.preventDefault();
        if (!this.draggingItem) return;

        const dropTarget = event.target.closest(this.itemSelector);
        if (dropTarget && dropTarget !== this.draggingItem) {
            const dropTopPosition = dropTarget.getBoundingClientRect().top;
            const dropBottomPosition = dropTarget.getBoundingClientRect().bottom;
            const cursorPosition = event.clientY;

            if (cursorPosition <= (dropTopPosition + ((dropBottomPosition - dropTopPosition) / 2))) {
                this.container.insertBefore(this.draggingItem, dropTarget);
            } else {
                this.container.insertBefore(this.draggingItem, dropTarget.nextSibling);
            }
        }
    }

    dragLeave(event) {
        const item = event.target.closest(this.itemSelector);
        if (item) {
            item.classList.remove('drop');
        }
    }

    drop(event) {
        event.preventDefault();
        // if (this.onDrop) {
        //     this.onDrop(event);
        // }
    }
}

export { DragDropManager };