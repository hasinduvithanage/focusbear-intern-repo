
def chk(d, j, t):
    r = []
    for i in range(len(d)):
        if d[i]['j'] == j:
            if d[i]['t'] != None:
                if d[i]['t'] > t:
                    r.append(d[i])
    a = 0
    for i in range(len(r)):
        a = a + r[i]['t']
    if len(r) != 0:
        a = a / len(r)
    else:
        a = 0
    return a