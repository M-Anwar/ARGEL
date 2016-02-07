__author__ = 'Shaham'
import numpy as np
from pprint import pformat

def print_result(hint, result):
    def encode(obj):
        if type(obj) is unicode:
            return obj.encode('utf-8')
        if type(obj) is dict:
            return {encode(k): encode(v) for (k, v) in obj.iteritems()}
        if type(obj) is list:
            return [encode(i) for i in obj]
        return obj
    print hint
    result = encode(result)
    print '\n'.join(['  ' + i for i in pformat(result, width = 75).split('\n')])

def mode(list):
    d = {}
    for i in list:
        try:
            d[i] += 1
        except(KeyError):
            d[i] = 1

    max = d.keys()[0]
    for key in d.keys()[1:]:
        if d[key] > max:
            max = key

    return max