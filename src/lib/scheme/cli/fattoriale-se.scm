(define fattoriale
  (lambda (n)
    (se
      (= n 0) 1
      (* n (fattoriale (- n 1))))))

(fattoriale 2)
