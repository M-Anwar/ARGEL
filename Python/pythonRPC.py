import time

#Demonstration to see if child_process blocks Node.js event loops

print("Hello World")
time.sleep(1)
print("This is from python NO DOUBT :D")

#Demonstrate STDERR output as well
raise ValueError('A very specific bad thing happened')