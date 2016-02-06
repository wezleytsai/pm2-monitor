// returns a promisified version of any async function that
// accepts node-style callbacks (nodebacks), where the cb
// is the last argument, and is called with error (or null)
// as first param, and result (or null) as second param
export default function(fn) {
    return function() {
        const args  = [].slice.call(arguments, 0, fn.length - 1);

        return new Promise((resolve, reject) => {
            args.push(function(err, res) {
                if (err) {
                    return reject(err);
                }

                resolve(res);
            });

            fn.apply(this, args);
        });
    };
};
