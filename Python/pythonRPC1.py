import time
import sys

#Demonstration to see if child_process blocks Node.js event loops

num1 = int(sys.argv[1])
num2 = int(sys.argv[2])
print num1+num2