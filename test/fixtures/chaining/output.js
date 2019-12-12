var A = {
  B: {
    C(n) {
      return n * n;
    },
    c: 1.7
  }
};
var result = numeral(A.B.C(numeral(3.3).value())).add(numeral(A.B.c).value()).add(numeral(Math.abs(numeral(A.B.C(numeral(-3.3).value())).add(numeral(1).value()).value())).value()).value();
