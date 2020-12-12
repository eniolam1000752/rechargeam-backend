const metaDataKey = Symbol();

export const UseMiddleware = (...arg: Array<string>) => (
  target,
  propertyValue,
  props: PropertyDescriptor,
) => {
  const funcObj = Reflect.getMetadata(metaDataKey, target);
  const middlewares = arg.map((item) => funcObj[item]);
  const temp = props.value;

  props.value = async function (req, resp) {
    for (let index in middlewares) {
      try {
        await middlewares[index].apply(this, [
          req,
          resp,
          () => {
            throw 'exited: ' + Object.keys(funcObj)[index];
          },
        ]);
      } catch (exp) {
        console.log(exp);
        if (!/exited/g.test(exp)) throw exp;
      }
    }
    try {
      await temp.apply(this, [
        req,
        resp,
        () => {
          throw 'exited main route';
        },
      ]);
    } catch (exp) {
      console.log(exp);
      if (!/exited/g.test(exp)) throw exp;
    }
  };
};

export function Middleware(target, propName, prop: PropertyDescriptor) {
  const funcObj = Reflect.getMetadata(metaDataKey, target) || {};
  Reflect.defineMetadata(
    metaDataKey,
    { ...funcObj, [propName]: prop.value },
    target,
  );
}
