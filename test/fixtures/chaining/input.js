var A = {
  B: {
    C(n) {
      return n;
    },
    c: 1.7
  }
};
var result = numeral(A.B.C(3.9) + A.B.c + Math.abs(A.B.C(-3.1) + 1));
