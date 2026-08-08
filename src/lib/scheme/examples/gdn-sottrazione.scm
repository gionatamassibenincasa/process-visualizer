; ambiente: minimo-numeri-naturali  

; (- n m) produce la differenza tra n e m
; es.: (- 5 2) -> 3
(definisci -
    (lambda (n m)
        (cond
            ((zero? m) n)
            (altrimenti (- (p n) (p m))))))

(- 5 2)