var A = {
  B: {
    C(n) {
      return n * n;
    },
    c: 1.7
  }
};
var result =numeral(A.B.C(3.3) + A.B.c + Math.abs(A.B.C(-3.3) + 1));
