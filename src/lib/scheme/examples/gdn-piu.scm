; ambiente: minimo-numeri-naturali  
; Il predicato `zero?` applicato ad n è vero se n è 0, falso altrimenti
; L'operatore `s` applicato ad n restituisce il numero successivo di n
; L'operatore `p` applicato a n  restituisce il numero precedente di n

; Un operatore per comporre numeri: +
; (+ n m) produce la somma di n e m
; es.: (+ 3 0) -> 3
;      (+ 3 2) -> 5
(definisci +
  (lambda (n m)
    (cond
	    ((zero? m) n)
	    (altrimenti (s (+ n (p m)))))))

(+ 3 0)
(+ 3 2)
