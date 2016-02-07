import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from sklearn.externals.six import StringIO
from sklearn import tree
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction import DictVectorizer
import csv

def overlap(a,b):
    return a[0] <= b[0] <= a[1] or b[0] <= a[0] <= b[1]

def convert_age_to_bin_array(age, range_of_age):
    bins = [(0,5),(6,12),(13,19),(20,27),(28,35),(36,50), (50,150)]
    bin_count = np.zeros((1,len(bins)))
    min = age-range_of_age
    max = age+range_of_age
    total_range = (min,max)

    for i in range(0,len(bins)):
        if overlap(total_range,bins[i]):
            bin_count[0,i] = 1



    return bin_count

def create_tree(X, Y):
    clf = tree.DecisionTreeClassifier(criterion='entropy')
    clf = clf.fit(X, Y)

    from IPython.display import Image
    import pydotplus
    dot_data = StringIO()
    #tree.export_graphviz(clf, out_file=dot_data)
    #feature_names = ['Gender', 'Age']
    feature_names = ['Gender','0-5','6-12','13-19','20-27','28-35','36-50','55+']
    target_names = []

    for i in range(1,len(Y)+1):
        target_names.append('Ad #' + str(i))


    tree.export_graphviz(clf, out_file=dot_data,
                         feature_names=feature_names,
                         class_names=target_names,
                         filled=True, rounded=True,
                         special_characters=True)

    graph = pydotplus.graph_from_dot_data(dot_data.getvalue())
    graph.write_pdf("Tree.pdf")

    return clf

def predict(clf, test_data):
    prediction = clf.predict(test_data)
    return prediction

def learn_tree_and_predict(Train, X_Test):
    '''
    X_dict = [{'0-5': 'yes',
               '6-12': 'yes',
               '13-19': 'yes',
               '20-27': 'yes',
               '28-35': 'yes',
               '36-50': 'yes',
               '55+': 'yes'}]

    vect = DictVectorizer(sparse=False)
    X_vector = vect.fit_transform(X_dict)
    '''

    #Extracting Data

    feature_names = ['Gender','0-5','6-12','13-19','20-27','28-35','36-50','55+']
    features = len(feature_names)
    age_features = features-1

    train_data = Train
    X= np.zeros((len(train_data),features))
    Y= np.zeros((len(train_data),1))

    for i in range(0,len(train_data)):
        row = train_data[i]
        gender = float(row[0])
        age = int(row[1])
        range_of_age = int(row[2])

        gender_ar = np.zeros((1,1)) + gender
        age_ar = convert_age_to_bin_array(age,range_of_age)
        X[i,:] = np.concatenate((gender_ar,age_ar),axis=1)
        Y[i,0] = int(row[3])

    print X
    print Y
    clf = create_tree(X,Y)

    #Testing
    to_predict_with = np.zeros((1,features))

    #gender value
    to_predict_with[0,0] = np.mean(X_Test[:,0],0) #Gender to predict

    #Finding age to predict
    age_hist = np.zeros((np.shape(X_Test)[0],age_features))
    for i in range(0,np.shape(X_Test)[0]):
        person = X_Test[i,:]
        age_hist[i,:] = convert_age_to_bin_array(person[1],person[2])

    age_test_groups = age_hist.sum(0) #Array of how many people fall into the age group specified by index
    max_age_groups = age_test_groups.argsort()[::-1] + 1 #Age groups present in test data in descending order of how many people are in them
    i = 0
    predictions = []

    while (len(predictions)==0 or X[int(predictions[i-1]-1),int(max_age_groups[i-1])]==0):
        to_predict_with[0,1:] = np.zeros((1,len(to_predict_with[0,1:])))
        to_predict_with[0,max_age_groups[i]] = 1
        predictions.append(predict(clf, to_predict_with))
        print "i: " + str(i) + ' predicted with:'
        print to_predict_with
        print predictions
        i += 1
        print X[int(predictions[i-1]-1),:]
        if (i == age_features):
            return predictions[0]

    return predictions[i-1]


'''

    test_x = np.zeros((len(genders),3))

    print 'Genders:' + str(genders)
    print 'Ages:' + str(ages)
    print 'Glasses?:' + str(glasses)
    print 'Smiling?' + str(smilings)

    for i in genders:
        if (i['value'] == 'Male'):
            test_x[0] += 1*i['confidence']/100
        elif (i['value'] == 'Female'):
            test_x[0] += -1*i['confidence']/100

    for i in ages:
        test_x[1] += i['value']
        test_x[2] += i['range']

    test_x[1] = test_x[1]/len(ages)
    test_x[0] = test_x[0]/len(genders)
    print str(test_x)

'''