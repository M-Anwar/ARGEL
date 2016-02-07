__author__ = 'Shaham'
import csv
from DecTree import *
from ApiCalls import *

#ids, tags = get_ads()
#print ids
#print tags

test_x = np.array([[-1, 25, 8],[-1, 23, 5],[-1,52,5],[1,25,2],[-1,30,1]])
#
file = 'train_data.csv'
with open(file, 'rb') as f:
        reader = csv.reader(f)
        X = list(reader)
#
# mean_gender = np.mean(test_x[:,0],0) #Gender to predict
# print mean_gender
#
# pred = learn_tree_and_predict(X, test_x)
# print pred[0]
#print "ID Predicted:" + str(ids[int(pred[0])-1])

print X
pred_k = K_near_age(X, test_x, 1 )
print pred_k[0]