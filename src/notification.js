class Notifications {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        if (!document.querySelector('.notification-container')) {
            this.container = document.createElement('div');
            this.container.classList.add('notification-container');
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.notification-container');
        }
    }

    show(message, type = 'info', duration = '3000') {
        const note = document.createElement('div');
        note.classList.add('notification');
        note.classList.add(type);

        note.textContent = message;

        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            info: '#2196F3',
            warning: '#FF9800'
        };

        note.style.backgroundColor = colors[type] || '#2196F3';

        this.container.appendChild(note);

        requestAnimationFrame(() => {
            note.style.opacity = '1';
            note.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            note.style.opacity = '0';
            note.style.transform = 'translateY(-10px)';
            setTimeout(() => note.remove(), 300);
        }, duration);
    }
}

export { Notifications };