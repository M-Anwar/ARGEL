__author__ = 'Shaham'
import csv
from DecTree import *

test_x = np.array([[1, 50, 8],[1, 29, 5],[1,52,5]])

file = 'train_data.csv'
with open(file, 'rb') as f:
        reader = csv.reader(f)
        X = list(reader)

prediction = learn_tree_and_predict(X, test_x)

print prediction