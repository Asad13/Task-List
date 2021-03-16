// Fade out effect
async function fadeOut(parent, child) {
    //child.classList.toggle('fade');
    var promise = new Promise((resolve, reject) => {
        var op = 1;

        var timer = setInterval(function () {
            if (op <= 0.1) {
                clearInterval(timer);
                parent.removeChild(child);
                resolve();
            }
            child.style.opacity = op;
            child.style.filter = 'alpha(opacity=' + op * 100 + ')';
            op -= 0.1;
        }, 30);
    });
    return promise;
}

function addToTaskList(index, task) {
    var elTr = document.createElement('tr');
    elTr.id = task.id;

    var elTh = document.createElement('th');
    elTh.classList.add("index");
    elTh.textContent = `${index}.`;
    elTr.appendChild(elTh);

    var elTdData = document.createElement('td');
    elTdData.classList.add("taskData");
    elTdData.textContent = task.data;
    var oldData;
    elTdData.addEventListener('dblclick', function () {
        oldData = this.textContent;
        this.contentEditable = true;
        this.focus();
        // New code to learn:
        if (document.body.createTextRange) {
            const range = document.body.createTextRange();
            range.moveToElementText(this);
            range.select();
        } else if (window.getSelection) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(this);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            console.warn("Could not select text in node: Unsupported browser.");
        }
        //
        this.addEventListener('keydown', event => {
            if (event.keyCode == 13 || event.which == 13) {
                event.preventDefault();
                this.contentEditable = false;
                if (this.textContent == "") {
                    alert("The field can't be empty.");
                    this.textContent = oldData;
                    return;
                }
                var id = this.parentElement.id;
                var tasks = JSON.parse(localStorage.tasks);
                for (var i = 0; i < tasks.length; i++) {
                    var savedId = tasks[i].id;
                    if (savedId == id) {
                        tasks[i].data = this.textContent;
                        break;
                    }
                }
                localStorage.tasks = JSON.stringify(tasks);
            }
        });
        this.addEventListener('focusout', event => {
            event.preventDefault();
            this.contentEditable = false;
            if (this.textContent == "") {
                alert("The field can't be empty.");
                this.textContent = oldData;
                return;
            }
            var id = this.parentElement.id;
            var tasks = JSON.parse(localStorage.tasks);
            for (var i = 0; i < tasks.length; i++) {
                var savedId = tasks[i].id;
                if (savedId == id) {
                    tasks[i].data = this.textContent;
                    break;
                }
            }
            localStorage.tasks = JSON.stringify(tasks);
        });
    });
    elTr.appendChild(elTdData);

    var elTdClose = document.createElement('td');
    elTdClose.classList.add("close");
    elTdClose.innerHTML = '&times;';
    elTdClose.addEventListener('click', async function () {
        if (confirm('Are you sure to delete this task?')) {
            var tasks = JSON.parse(localStorage.tasks);
            var id = this.parentElement.getAttribute('id');
            for (var i = 0; i < tasks.length; i++) {
                var savedId = tasks[i].id;
                if (savedId == id) {
                    tasks.splice(i, 1);
                    break;
                }
            }
            localStorage.tasks = JSON.stringify(tasks);
            //this.parentElement.parentElement.removeChild(this.parentElement);
            await fadeOut(this.parentElement.parentElement, this.parentElement);
            if (tasks.length > 0) {
                var indices = document.querySelectorAll('th.index');
                for (var i = 0; i < indices.length; i++) {
                    //console.log(i);
                    indices[i].textContent = `${i + 1}.`;
                }
            } else {
                document.getElementById('clearRow').style.display = 'none';
            }
        }
    });
    elTr.appendChild(elTdClose);
    document.getElementById('taskList').appendChild(elTr);
}

function showTask() {
    if (localStorage.tasks) {
        var tasks = JSON.parse(localStorage.tasks);

        if (tasks.length > 0) {
            for (var i = 0; i < tasks.length; i++) {
                addToTaskList((i + 1), tasks[i]);
            }
            document.getElementById('clearRow').style.display = 'flex';
        } else {
            document.getElementById('clearRow').style.display = 'none';
        }
    }
};

showTask();

function addTask() {
    var value = document.getElementById('taskTaker').value;
    document.getElementById('taskTaker').value = "";
    if (value) {
        var tasks, task;
        if (localStorage.tasks) {
            tasks = JSON.parse(localStorage.tasks);
            task = { id: tasks.length, data: value };
            tasks.push(task);
            localStorage.tasks = JSON.stringify(tasks);
        } else {
            tasks = [];
            task = { id: tasks.length, data: value };
            tasks.push(task);
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
        addToTaskList(tasks.length, task);
        document.getElementById('clearRow').style.display = 'flex';
    } else {
        alert("Write something about the task.");
    }
}

document.getElementById('taskTaker').addEventListener("keydown", event => {
    if (event.isComposing) {
        return;
    }
    if (event.keyCode == 13 || event.which == 13) {
        addTask()
    }
    // do something
});
document.getElementById('addTask').addEventListener('click', addTask);

function removeAllTasks() {
    var taskList = document.getElementById('taskList');
    var tasks = document.querySelectorAll('tr');
    for (var i = 0; i < tasks.length; i++) {
        //await fadeOut(taskList,tasks[i])
        taskList.removeChild(tasks[i]);
    }
}


document.getElementById('clearAllTask').addEventListener('click', function () {
    if (confirm('Are you sure you want to remove all tasks?')) {
        localStorage.removeItem('tasks');
        removeAllTasks();
        document.getElementById('clearRow').style.display = 'none';
    }
});

function filterTasks(filterField) {
    var filter = filterField.value;
    var tasks = document.querySelectorAll('td.taskData');
    if (filter) {
        document.getElementById('taskTaker').setAttribute('disabled', 'disabled');
        var len = filter.length;
        filter = filter.toLowerCase();
        var count = 1;
        //var filtered = [];
        // Hard match finder: (checks from the beginning of the task data with the filter value)
        /*tasks.forEach(task => {
            var data = task.textContent.toLowerCase();
            if (data == filter) {
                task.style.display = 'none';
            }else{
                if(count % 2 == 1){
                    task.parentElement.style.backgroundColor = '#D9663D';
                }else{
                    task.parentElement.style.backgroundColor = '#F2935C';
                }
                count++;
            }
        });*/
        // Soft match finder: (any task that contains filter value anywhere in it)
        tasks.forEach(task => {
            var data = task.textContent.toLowerCase();
            if (data.search(filter) == -1) {
                task.parentElement.style.display = 'none';
            } else {
                if (count % 2 == 1) {
                    task.parentElement.style.backgroundColor = '#D9663D';
                } else {
                    task.parentElement.style.backgroundColor = '#F2935C';
                }
                count++;
            }
        });
    } else {
        removeAllTasks();
        showTask();
        if (document.getElementById('taskTaker').hasAttribute('disabled')) {
            document.getElementById('taskTaker').removeAttribute('disabled');
        }
    }
}

document.getElementById('filter').addEventListener('keyup', function () {
    filterTasks(this);
});