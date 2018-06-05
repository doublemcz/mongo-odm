"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function PreCreate() {
    return hook('preCreate');
}
exports.PreCreate = PreCreate;
function PostCreate() {
    return hook('postCreate');
}
exports.PostCreate = PostCreate;
function PreUpdate() {
    return hook('preUpdate');
}
exports.PreUpdate = PreUpdate;
function PostUpdate() {
    return hook('postUpdate');
}
exports.PostUpdate = PostUpdate;
function PreDelete() {
    return hook('preDelete');
}
exports.PreDelete = PreDelete;
function PostDelete() {
    return hook('postDelete');
}
exports.PostDelete = PostDelete;
function hook(type) {
    return function (target, propertyKey) {
        if (!target._odm) {
            target._odm = { hooks: { type: [] } };
        }
        else if (!target._odm.hooks) {
            target._odm.hooks = {};
            target._odm.hooks[type] = [];
        }
        else if (!target._odm.hooks[type]) {
            target._odm.hooks[type] = [];
        }
        target._odm.hooks[type].push(propertyKey);
    };
}
