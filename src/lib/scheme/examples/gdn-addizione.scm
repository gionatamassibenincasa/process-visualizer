; ambiente: minimo-numeri-naturali  
; Il predicato `zero?` applicato ad n è vero se n è 0, falso altrimenti
; L'operatore `s` applicato ad n restituisce il numero successivo di n
; L'operatore `p` applicato a n  restituisce il numero precedente di n

; Una astrazione per comporre numeri: addizione
; (addizione n m) produce la somma di n e m
; es.: (addizione 3 0) -> 3
;      (addizione 3 2) -> 5
(definisci addizione
  (lambda (n m)
    (cond
	    ((zero? m) n)
	    (altrimenti (s (addizione n (p m)))))))

(addizione 3 0)
(addizione 3 2)
