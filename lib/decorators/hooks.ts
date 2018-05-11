export function PreCreate() {
  return hook('preCreate');
}

export function PostCreate() {
  return hook('postCreate');
}

export function PreUpdate() {
  return hook('preUpdate');
}

export function PostUpdate() {
  return hook('postUpdate');
}

export function PreDelete() {
  return hook('preDelete');
}

export function PostDelete() {
  return hook('postDelete');
}

function hook(type: string) {
  return function (target: any, propertyKey: string) {
    if (!target._odm) {
      target._odm = {hooks: {type: []}};
    } else if (!target._odm.hooks) {
      target._odm.hooks = {};
      target._odm.hooks[type] = [];
    } else if (!target._odm.hooks[type]) {
      target._odm.hooks[type] = [];
    }

    target._odm.hooks[type].push(propertyKey);
  };
}