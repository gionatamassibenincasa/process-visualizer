; ambiente: minimo-numeri-naturali  

; (<? n m) produce #t se n è minore di m, #f altrimenti
; es.: (< 2 5) -> #t
;      (< 5 2) -> #f
(definisci <
  (lambda (n m)
    (cond
      ((zero? m) #f)
      ((zero? n) #t)
      (altrimenti (< (p n) (p m))))))

(< 2 5)
(< 5 2)
