const t = require('@babel/types');

const OPERATOR_MAP = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide',
};
module.exports = function() {
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
  const expressionVisitor = {
    'NumericLiteral|UnaryExpression'(path, state) {
      if (path.parent.type === 'CallExpression') {
        // Math.cos(6)
        path.replaceWith(wrapPrecision(path.node, state.opts.precision));
      } else {
        path.replaceWith(
          t.callExpression(t.identifier('numeral'), [
            wrapPrecision(path.node, state.opts.precision),
          ]),
        );
      }
      path.skip();
      // path.stop(); // stop 之后后面的兄弟节点也会停止
    },
    Identifier(path, state) {
      // a * 7 -> (a).toFixed + ... 这种情况需要， 其他情况 Identifier 不为变量值（-a, 这种情况在 UnaryExpression 处理了）
      if (path.parent.type !== 'BinaryExpression') return;
      if (path.parent.type === 'CallExpression') {
        path.replaceWith(wrapPrecision(path.node, state.opts.precision));
      } else {
        path.replaceWith(
          t.callExpression(t.identifier('numeral'), [
            wrapPrecision(path.node, state.opts.precision),
          ]),
        );
      }
      path.skip();
    },
    BinaryExpression: {
      exit(path) {
        let rightNode = path.node.right;
        if (
          rightNode.type === 'CallExpression' &&
          rightNode.callee.name === 'numeral'
        )
          rightNode = rightNode.arguments[0];
        path.replaceWith(
          t.callExpression(
            t.memberExpression(
              path.node.left,
              t.identifier(OPERATOR_MAP[path.node.operator]),
            ),
            [rightNode],
          ),
        );
        path.skip();
      },
    },
    CallExpression: {
      exit(path, state) {
        if (path.node.arguments[0] && path.node.arguments[0].ca) {
          // path.replaceWith(
          //   t.callExpression(
          //     t.memberExpression(node, t.identifier('value')),
          //     [],
          //   ),
          // );
        } else {
          path.replaceWith(wrapPrecision(path.node, state.opts.precision));
        }
        path.skip();
      },
    },
  };
  return {
    visitor: {
      CallExpression(path, state) {
        if (path.node.callee.name !== (state.opts.numeralName || 'numeral'))
          return;
        path.traverse(expressionVisitor, state);
        const node = path.node.arguments[0];
        path.replaceWith(
          t.callExpression(t.memberExpression(node, t.identifier('value')), []),
        );
        path.stop();
      },
    },
  };
};
