import numpy as np
import cv2

font = cv2.FONT_HERSHEY_SIMPLEX
image = cv2.imread(url)
#print image
pt1 = (int(each_face['position']['center']['x']*width/100-each_face['position']['width']*width/100/2),int(each_face['position']['center']['y']*height/100+each_face['position']['height']*height/100/2))
pt2 = (int(each_face['position']['center']['x']*width/100+each_face['position']['width']*width/100/2),int(each_face['position']['center']['y']*height/100-each_face['position']['height']*height/100/2))
image = cv2.rectangle(image,pt1,pt2,(0,255,0))
image = cv2.circle(image,(int(each_face['position']['eye_left']['x']*width/100),int(each_face['position']['eye_left']['y']*height/100)),5,(0,255,0))
image = cv2.circle(image,(int(each_face['position']['eye_right']['x']*width/100),int(each_face['position']['eye_right']['y']*height/100)),5,(0,255,0))
image = cv2.circle(image,(int(each_face['position']['nose']['x']*width/100),int(each_face['position']['nose']['y']*height/100)),5,(0,255,0),-1)
image = cv2.circle(image,(int(each_face['position']['mouth_left']['x']*width/100),int(each_face['position']['mouth_left']['y']*height/100)),5,(0,255,0),-1)
image = cv2.circle(image,(int(each_face['position']['mouth_right']['x']*width/100),int(each_face['position']['mouth_right']['y']*height/100)),5,(0,255,0),-1)
image = cv2.putText(image, str(attribute['gender']['value']) + ' ' + str(attribute['gender']['confidence']),(pt2[0]*-1.2,pt2[1]*-1.2),font,1, (0,255,0),2,cv2.LINE_AA)
image = cv2.putText(image, 'Age: ' + str(attribute['age']['value']) + ' Range: ' + str(attribute['age']['range']),(pt2[0]*-1.2,pt2[1]),font,1,(0,255,0),2,cv2.LINE_AA)
#cv2.imshow('preview',image)
#cv2.waitKey(0)
cv2.imwrite('test_image_new.jpg',image)