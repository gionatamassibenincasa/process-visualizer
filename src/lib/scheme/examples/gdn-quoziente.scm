; ambiente: nat-add-sot-min

(definisci quoziente
  (lambda (n m)
    (cond
      ((< n m) 0)
      (altrimenti (s (quoziente (- n m) m))))))

(quoziente 12 4)