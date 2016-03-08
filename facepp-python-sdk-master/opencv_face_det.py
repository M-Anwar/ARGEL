import numpy as np
import cv2


def face_in_area(faces, midw, midh, task='all'):
    if task == 'all':
        c = [0,0,0,0]
        i = 0
        while (i<len(faces)):

            if faces[i][0] <midw and faces[i][1] <midh:
                c[0] += 1
            elif faces[i][0] <midw and faces[i][1] >midh:
                c[1] += 1
            elif faces[i][0] >midw and faces[i][1] >midh:
                c[2] += 1
            elif faces[i][0] >midw and faces[i][1] <midh:
                c[3] += 1
            i+=1
        return c
    elif task == 'width':
        c = [0,0]
        i = 0
        while (i<len(faces)):

            if faces[i][0] <midw:
                c[0] += 1
            elif faces[i][0] >midw:
                c[1] += 1
            i+=1
        return c
    elif task == 'height':
        c = [0,0]
        i = 0
        while (i<len(faces)):

            if faces[i][1] <midh:
                c[0] += 1
            elif faces[i][1] >midh:
                c[1] += 1
            i+=1
        return c

def divide_im (img,wr,hr,pocx,pocy, faces):
    height = img.shape[0]/2
    width = img.shape[1]/2
    if pocx[0]>0 or pocx[1]>0:
        m = np.argmin([width-pocx[0],pocx[1]-width])
        width = pocx[m]
    if pocy[0]>0 or pocy[1]>0:
        m = np.argmin([height-pocy[0],pocy[1]-height])
        height = pocy[m]
    print width
    print height

    if wr<0.06 and hr<0.1:
        divided_imgs = ([img[:height,:width],img[height+1:,:width],img[height+1:,width+1:], img[:height,width+1:]])
        c = face_in_area(faces,width,height,'all')
        print c
        divided_imgs = [divided_imgs[i] for i in range(len(c)) if c[i]>0]
    elif wr<0.06:
        divided_imgs = ([img[:,:width],img[:,width+1:]])
        c = face_in_area(faces,width,height,'width')
        print c
        divided_imgs = [divided_imgs[i] for i in range(len(c)) if c[i]>0]
    elif hr<0.1:
        divided_imgs = ([img[:height,:],img[height+1:,:]])
        c = face_in_area(faces,width,height,'height')
        divided_imgs = [divided_imgs[i] for i in range(len(c)) if c[i]>0]
    else:
        divided_imgs = ([img])

    return divided_imgs

def detect_image (img_url):
    face_cascade = cv2.CascadeClassifier('facepp-python-sdk-master/haarcascades/haarcascade_frontalface_alt.xml')
    #eye_cascade = cv2.CascadeClassifier('haarcascades/haarcascade_eye.xml')

    #img_url = 'test_pic/test_face.jpg'
    #img_url = 'test_pic/test_face_fullwide.jpg'
    img = cv2.imread(img_url)
    #img = img[img.shape[0]/2:,0:img.shape[1]/2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    height = img.shape[0]
    width = img.shape[1]
    wmid = width/2
    hmid = height/2
    print "width of pic:" + str(width)
    print "height of pic: " + str(height)
    avgw = 0.0
    avgh = 0.0
    pocx = [wmid,wmid]
    pocy = [hmid,hmid]
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=1, minSize=(16, 16),flags=cv2.CASCADE_SCALE_IMAGE)

    total_found = len(faces)
    print "OpenCV faces found: " + str(total_found)
    if total_found>0:
        all_faces = []
        for (x,y,w,h) in faces:
            avgw += w
            avgh += h
            if wmid in range(x,x+w):
                if x<pocx[0]: pocx[0] = x
                if x+w>pocx[1]: pocx[1] = x+w
            if hmid in range(y,y+h):
                if y<pocy[0]: pocy[0] = y
                if y+h>pocy[1]: pocy[1] = y+h

            all_faces.append((x+w/2,y+h/2))
            #img = cv2.rectangle(img,(x,y),(x+w,y+h),(255,0,0),2)
            roi_gray = gray[y:y+h, x:x+w]
            roi_color = img[y:y+h, x:x+w]
            left,right,down, up = [x,x+w,y,y+h]
            if (y+h+20>height):
                up = height
            if (y-20<0):
                down = 0
            if (x+w+20>width):
                right = width
            if (x-20<0):
                left = 0
            # im_to_send = img[down:up,left:right]
            # # im_to_send = cv2.resize(im_to_send, (200, 100))
            # #
            # cv2.imshow('face',im_to_send)
            # cv2.waitKey(0)

            # eyes = eye_cascade.detectMultiScale(roi_gray)
            # for (ex,ey,ew,eh) in eyes:
            #     cv2.rectangle(roi_color,(ex,ey),(ex+ew,ey+eh),(0,255,0),2)

            avgw =  avgw/total_found
            avgh =  avgh/total_found


            print "ratio of avg width of face to Width of image: " + str(avgw/width)
            print "ratio of avg height of face to Height of image: " + str(avgh/height)
            #print pocx
            #print pocy
            to_send = divide_im(img,avgw/width,avgh/height,pocx,pocy,all_faces)
            print "# of Images to send: " + str(len(to_send))
            # cv2.imshow('img',img)
            # cv2.waitKey(0)
            #for i in range(len(to_send)):
            #    cv2.imshow('img_crop',to_send[i])
            #    cv2.waitKey(0)

            #cv2.destroyAllWindows()
            return 'valid',to_send
    else:
        to_send = [img]
        return 'not_valid', to_send


if __name__ == '__main__':
    img_url = 'test_pic/test_face.jpg'
    #img_url = 'test_pic/test_face_fullwide.jpg'
    val, s = detect_image(img_url)
    print len(s)