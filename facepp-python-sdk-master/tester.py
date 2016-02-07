__author__ = 'Shaham'
import csv
from DecTree import *
from ApiCalls import *

ids, tags = get_ads()
#print ids
#print tags

test_x = np.array([[-1, 25, 8],[-1, 23, 5],[-1,52,5]])

# file = 'train_data.csv'
# with open(file, 'rb') as f:
#         reader = csv.reader(f)
#         X = list(reader)

pred = learn_tree_and_predict(tags, test_x)
print pred[0]
print "ID Predicted:" + str(ids[int(pred[0])-1])