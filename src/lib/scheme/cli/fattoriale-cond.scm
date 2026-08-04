(definisci fattoriale
  (lambda (n)
    (cond
      ((= n 0) 1)
      (altrimenti (* n (fattoriale (- n 1)))))))

(fattoriale 2)
