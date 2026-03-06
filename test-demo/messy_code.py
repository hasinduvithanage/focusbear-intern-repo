numbers=[1,2,3,4,5,6,7,8,9,10]
s=0
for i in numbers:
    if i%2==0:
        if i>3:
            s=s+i*2
        else:
            s=s+i
    else:
        if i<5:
            s=s+i
        else:
            s=s+i*3
print(s)

"""

This code is difficult to read because:
- variable names such as `s` and `i` do not explain the meaning behind them
- the rules for calculation are not obvious at first glance
- there is no separation between calculation and output
- it would be harder to modify later without re-reading the whole block 

"""