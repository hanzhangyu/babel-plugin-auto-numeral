const t = require('@babel/types');

const OPERATOR_MAP = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide',
};

/**
 * resolve precision
 * @param node
 * @param {number|null} precision
 * @returns {CallExpression|*}
 */
const wrapPrecision = (node, precision) => {
  if (precision === undefined || precision === null) return node;
  return t.callExpression(
    t.memberExpression(
      node.type === 'NumericLiteral' ? t.parenthesizedExpression(node) : node,
      t.identifier('toFixed'),
    ),
    [t.numericLiteral(precision)],
  );
};

/**
 * get the top callee`s id for chaining call
 * @param node
 * @returns {string|null}
 */
function getRealCalleeFromCallExpression(node) {
  /* istanbul ignore next */
  if (node.type !== 'CallExpression') return null; // this line is never reached, bcz every argument was wrapped with the numeral, (for edge case I am not found)
  if (node.callee.type === 'Identifier') return node.callee.name;
  /* istanbul ignore else */
  if (node.callee.type === 'MemberExpression')
    return getRealCalleeFromCallExpression(node.callee.object);
  /* istanbul ignore next */
  return null; // this line is never reached, bcz callee type is Identifier|MemberExpression, (for edge case I am not found)
}

/**
 * convert numeral instance to number
 * @param node
 * @param opts
 * @returns {CallExpression|*}
 */
function unwrapNumeral(node, opts) {
  /* istanbul ignore else */
  if (getRealCalleeFromCallExpression(node) === opts.numeralName) {
    // do not use toFixed, bcz precision resolved in numeral wrap
    return wrapGetNumeralValue(node);
  }
  /* istanbul ignore next */
  return node; // this line is never reached, bcz every argument was wrapped with the numeral, (for edge case I am not found)
}

/**
 * wrap with .value()
 * @param node
 * @returns {CallExpression}
 */
function wrapGetNumeralValue(node) {
  return t.callExpression(t.memberExpression(node, t.identifier('value')), []);
}

/**
 * convert number to numeral instance
 * @param node
 * @param opts
 * @returns {CallExpression}
 */
function wrapNumeral(node, opts) {
  return t.callExpression(t.identifier(opts.numeralName), [
    wrapPrecision(node, opts.precision),
  ]);
}

module.exports = function() {
  const expressionVisitor = {
    'NumericLiteral|UnaryExpression|UpdateExpression'(path, state) {
      // convert to numeral(xxx.toFixed(xxx))
      path.replaceWith(wrapNumeral(path.node, state.opts));
      path.skip();
    },
    Identifier(path, state) {
      // skip function name
      if (
        path.parent.type === 'CallExpression' &&
        path.parent.callee === path.node
      ) {
        return;
      }
      // skip chaining
      if (path.parent.type === 'MemberExpression') {
        return;
      }
      path.replaceWith(wrapNumeral(path.node, state.opts));
      path.skip();
    },
    MemberExpression: {
      exit(path, state) {
        if (
          path.parent.type === 'MemberExpression' ||
          path.parent.type === 'CallExpression'
        ) {
          return;
        }
        // resolve chaining value, like a.b.c (not callee or chaining object)
        path.replaceWith(wrapNumeral(path.node, state.opts));
        path.skip();
      },
    },
    BinaryExpression: {
      exit(path, state) {
        let rightNode = path.node.right;
        path.replaceWith(
          t.callExpression(
            t.memberExpression(
              path.node.left,
              t.identifier(OPERATOR_MAP[path.node.operator]),
            ),
            [unwrapNumeral(rightNode, state.opts)],
          ),
        );
        path.skip();
      },
    },
    CallExpression: {
      exit(path, state) {
        // unwrap numeral for arguments
        path.node.arguments = path.node.arguments.map(node =>
          unwrapNumeral(node, state.opts),
        );
        path.replaceWith(wrapNumeral(path.node, state.opts));
        path.skip();
      },
    },
  };
  return {
    visitor: {
      CallExpression(path, state) {
        state.opts.numeralName = state.opts.numeralName || 'numeral';
        if (path.node.callee.name !== state.opts.numeralName) return;
        path.traverse(expressionVisitor, state);
        const node = path.node.arguments[0];
        path.replaceWith(wrapGetNumeralValue(node));
        path.stop();
      },
    },
  };
};
