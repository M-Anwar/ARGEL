import numpy as np
import matplotlib.pyplot as plt
from sklearn.externals.six import StringIO
from sklearn import tree

def create_tree(X, Y):
    X = X
    Y = Y
    clf = tree.DecisionTreeClassifier()
    clf = clf.fit(X, Y)

    from IPython.display import Image
    import pydotplus
    dot_data = StringIO()
    tree.export_graphviz(clf, out_file=dot_data)
    graph = pydotplus.graph_from_dot_data(dot_data.getvalue())
    graph.write_pdf("Tree.pdf")

    return clf

def predict(clf, test_data):
    Y = clf.predict(test_data)
    return Y