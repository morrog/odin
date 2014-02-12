var Odin = require("../src/odin"),
    bind = require("mout/function/bind");

var TodoModel = Odin.Model.extend({
    properties: {
        what: "What to do?"
    }
});

var TodoView = Odin.Base.extend({
    storage: null,
    todo: null,

    inject: {
        storage: "localStorage"
    },

    init: function() {
        var self = this;

        this.storage.get("todo", "item", function(todo) {
            self.todo = new TodoModel(todo);

            document.querySelector("#todo").value = self.todo.what;
        });

        document.querySelector("#todo").onchange = bind(this.update, this);

        return this;
    },

    update: function() {
        this.todo.what = document.querySelector("#todo").value;

        this.storage.update(this.todo, { store: "todo", key: "item" });
    }
});

new TodoView();