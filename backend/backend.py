from tornado.web import Application
from tornado.web import RequestHandler, StaticFileHandler
from tornado.ioloop import IOLoop
from sqlalchemy import create_engine
import json
from bson import json_util
import datetime
from tornado import escape

from google.oauth2 import id_token
from google.auth.transport import requests

import base64
import uuid

CLIENT_ID = '<CIENTID>'

db1 = create_engine('<POSTGRESSQLSTRING>')
conn1 = db1.connect()

DT_HANDLER = lambda obj: obj.isoformat() if isinstance(obj, datetime.datetime) or isinstance(obj, datetime.date) else None

### SQL STRINGS ###
sqlUniversity = "SELECT * FROM university WHERE email_postfix = %s"
sqlUserByEmail = "SELECT * FROM users WHERE email = %s"
sqlLocationIdByName = "SELECT * FROM location WHERE name = %s"
sqlRegister = "INSERT INTO users (first_name, last_name, birth_date, email, image_url, uniid) VALUES (%s, %s, %s, %s, NULL, %s)"
sqlRegisterWithImage = "INSERT INTO users (first_name, last_name, birth_date, email, image_url, uniid) VALUES (%s, %s, %s, %s, %s, %s)"
sqlgetGroups = "WITH currentUniID AS(SELECT DISTINCT uniid FROM users WHERE email = %s) SELECT *, groups.image_url as group_image_url FROM currentUniID, groups  JOIN users ON userid=created_user_id  LEFT JOIN ( SELECT gid as cap_gid, count(*) as current_capacity FROM users_join_groups GROUP BY gid) as t_cc ON t_cc.cap_gid = groups.gid WHERE users.uniid = currentUniID.uniid and groups.gid NOT IN (SELECT gid from users_join_groups WHERE userid = %s) and coalesce(current_capacity, 0)<capacity"
sqlgetMyGroups = "WITH currentUniID AS(SELECT DISTINCT uniid FROM users WHERE email = %s) SELECT *, groups.image_url  as group_image_url FROM currentUniID, groups JOIN users ON userid=created_user_id WHERE users.uniid = currentUniID.uniid and gid in (SELECT gid from users_join_groups WHERE userid = %s)"
sqlgetGroupMessages = "SELECT users.userid as userid, concat(first_name, ' ', last_name) as name, users.image_url as avatar, mid as _id, created_at as createdAt, message as text FROM message LEFT JOIN users on users.userid = message.userid WHERE gid = %s ORDER BY createdat DESC"
sqljoinGroup = "INSERT INTO users_join_groups VALUES (%s, %s)"
sqladdGroup = "INSERT INTO groups (name, sport, capacity, created_user_id, description) VALUES (%s, %s, %s, %s, %s)"
sqladdGroupWithImage = "INSERT INTO groups (name, sport, capacity, created_user_id, description, image_url) VALUES (%s, %s, %s, %s, %s, %s)"  
sqlleaveGroup = "DELETE FROM users_join_groups WHERE userid = %s and gid = %s"
sqlInsertMsg = "INSERT INTO message (userid, gid, message) VALUES (%s, %s, %s)"
sqlGetGroupByName = "SELECT * FROM groups WHERE name = %s"
sqlEvents = "SELECT events.name AS name, events.recurrency AS recurrency, events.time AS time, location.name AS location FROM events,location WHERE gid = %s AND events.lid = location.lid"
sqlcreateEvent = "INSERT INTO events (name, recurrency, time, lid, userid, gid) VALUES (%s, %s, %s, %s, %s, %s)"
sqlAddSkill = "INSERT INTO groups_skill_level VALUES (%s, %s)"
sqlAddDegree = "INSERT INTO groups_degree_level VALUES (%s, %s)"
sqlAddGender = "INSERT INTO groups_gender VALUES (%s, %s)"
sqlGetGroupByName = "SELECT * FROM groups WHERE name = %s"
sqlGetUsersPerGroup = "SELECT * FROM users, users_join_groups WHERE gid = %s AND users.userid = users_join_groups.userid"
sqlUserGroupCheck = "SELECT * from users_join_groups WHERE userid = %s and gid = %s"
###################

def json_encode(value):
    return json.dumps(value, default=DT_HANDLER).replace("</", "<\/")

def GoogleLogin(token, email):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return {'error': 'Error in login - token and/or email address does not match!'}
        if idinfo['email'] != email:
            return {'error': 'Error in login - token and/or email address does not match!'}
        return idinfo
    except ValueError:
        return {'error': 'Error in login - token and/or email address does not match!'}

def getUniIDfromEMail(email):
    email_split = email.split('@')
    if len(email_split)>2:
        return -1
    data = conn1.execute(sqlUniversity, ('@' + email_split[1]))
    result = result_to_dict(data)
    if len(result['result']) == 0:
        return(-1)
    else:
        return result['result'][0]['uniid']

def getUserIdByEmail(email):
    data = conn1.execute(sqlUserByEmail, (email))
    result = result_to_dict(data)
    if len(result['result']) == 0:
        return(-1)
    else:
        return result['result'][0]['userid']

def getLocationIdByName(location):
    data = conn1.execute(sqlLocationIdByName, (location))
    result = result_to_dict(data)
    if len(result['result']) == 0:
        return(-1)
    else:
        return result['result'][0]['lid']

def checkUserGroupMatch(userid, gid):
    data = conn1.execute(sqlUserGroupCheck, (userid, gid))
    result = result_to_dict(data)
    if len(result['result']) == 1:
        return(True)
    else:
        return(False)

def result_to_dict(result):
    output = {}
    tmp_output = []
    for row in result:
        tmp_output.append(dict(row))
    output['result'] = tmp_output
    escape.json_encode = json_encode
    return(output)

class login(RequestHandler):
    def post(self):
        request_body = escape.json_decode(self.request.body)
        logged_in = GoogleLogin(request_body['token'], request_body['email'])
        if 'error' in logged_in:
            self.write(logged_in)
        else:
            uniid = getUniIDfromEMail(logged_in['email'])
            if uniid == -1:
                self.write({'mainView': 'login', 'error': 'Your university or email provider is not supported. Please use your university email to login.'})
            else:
                data = conn1.execute(sqlUserByEmail, (logged_in['email']))
                result = result_to_dict(data)
                if len(result['result'])>0:
                    # User has a profile
                    self.write({'mainView': 'main'})
                else:
                    if len(result['result'])==0:
                        # User has no profile
                        self.write({'mainView': 'register'})

class registerWithImage(RequestHandler):
    def post(self):
        first_name = self.get_argument('first_name')
        last_name = self.get_argument('last_name')
        birth_date = self.get_argument('birth_date')
        email = self.get_argument('email')
        token = self.get_argument('token')
        logged_in = GoogleLogin(token, email)
        if 'error' in logged_in:
            self.write(logged_in)
        else:
            uniid = getUniIDfromEMail(email)
            unique_filename = ''
            if ('photo' in self.request.files):
                unique_filename = str(uuid.uuid4())
                unique_filename = '/www/' + unique_filename + '.png'
                file1 = self.request.files['photo'][0]
                g = open('.' + unique_filename, "wb")
                g.write(file1['body'])
                g.close()
            else:
                unique_filename = ''
            data = conn1.execute(sqlRegisterWithImage, (first_name, last_name, birth_date, email, unique_filename, uniid))
            self.write({'mainView': 'main'})

class addGroupWithImage(RequestHandler):
    def post(self):
        email = self.get_argument('email')
        created_user_id = getUserIdByEmail(email)
        token = self.get_argument('token')
        name = self.get_argument('groupName')
        sport = self.get_argument('sport')
        capacity = self.get_argument('capacity')
        description = self.get_argument('description')
        addTag = self.get_argument('addTag')
        addTag = json.loads(addTag)
        unique_filename = ''
        logged_in = GoogleLogin(token, email)
        if 'error' in logged_in:
            self.write(logged_in)
        else:
            if ('photo' in self.request.files):
                unique_filename = str(uuid.uuid4())
                unique_filename = '/www/' + unique_filename + '.png'
                file1 = self.request.files['photo'][0]
                g = open('.' + unique_filename, "wb")
                g.write(file1['body'])
                g.close()
            else:
                unique_filename = ''
            data = conn1.execute(sqladdGroupWithImage, (name, sport, capacity, created_user_id, description, unique_filename))
            data = conn1.execute(sqlGetGroupByName, (name))
            result = result_to_dict(data)
            gid = result['result'][0]['gid']
            skill = addTag['skill']
            degree = addTag['degree_level']
            gender = addTag['gender']
            for key in skill.keys():
                if skill[key]:
                    data = conn1.execute(sqlAddSkill, (gid, key))
            for key in degree.keys():
                if degree[key]:
                    data = conn1.execute(sqlAddDegree, (gid, key))
            for key in gender.keys():
                if gender[key]:
                    data = conn1.execute(sqlAddGender, (gid, key))
            data = conn1.execute(sqljoinGroup, (created_user_id, gid))
            self.write({'msg': 'Successfully created a group'})       

class getUserProfile(RequestHandler):
    def post(self):
        request_body = escape.json_decode(self.request.body)
        logged_in = GoogleLogin(request_body['token'], request_body['email'])
        if 'error' in logged_in:
            self.write(logged_in)
        else:
            data = conn1.execute(sqlUserByEmail, (request_body['email']))
            result = result_to_dict(data)
            self.write(result)

class getGroups(RequestHandler):
    def post(self):
        request_body = escape.json_decode(self.request.body)
        logged_in = GoogleLogin(request_body['token'], request_body['email'])
        if 'error' in logged_in:
            self.write(logged_in)
        else:
            userid = getUserIdByEmail(request_body['email'])
            appliedFilter = request_body['appliedFilter']
            list_add_values = []
            genderFilter = appliedFilter['gender']
            skillFilter = appliedFilter['skill']
            degreeFilter = appliedFilter['degree_level']
            sportFilter = appliedFilter['sport']
            tmp_sqlgetGroups = sqlgetGroups
            if not(all(list(sportFilter.values()))) and not(all(list([not(x) for x in sportFilter.values()]))):
                tmp_sqlgetGroups += ' AND groups.gid in (SELECT gid from groups where sport IN ('
                for key in sportFilter.keys():
                    if sportFilter[key]:
                        tmp_sqlgetGroups += '%s,'
                        list_add_values.append(key)
                tmp_sqlgetGroups = tmp_sqlgetGroups[:-1] + '))'
            if not(all(list(genderFilter.values()))) and not(all(list([not(x) for x in genderFilter.values()]))):
                tmp_sqlgetGroups += ' AND groups.gid in (SELECT gid from groups_gender where gender IN ('
                for key in genderFilter.keys():
                    if genderFilter[key]:
                        tmp_sqlgetGroups += '%s,'
                        list_add_values.append(key)
                tmp_sqlgetGroups = tmp_sqlgetGroups[:-1] + '))'
            if not(all(list(skillFilter.values()))) and not(all(list([not(x) for x in skillFilter.values()]))):
                tmp_sqlgetGroups += ' AND groups.gid in (SELECT gid from groups_skill_level where skill_level IN ('
                for key in skillFilter.keys():
                    if skillFilter[key]:
                        tmp_sqlgetGroups += '%s,'
                        list_add_values.append(key)
                tmp_sqlgetGroups = tmp_sqlgetGroups[:-1] + '))'
            if not(all(list(degreeFilter.values()))) and not(all(list([not(x) for x in degreeFilter.values()]))):
                tmp_sqlgetGroups += ' AND groups.gid in (SELECT gid from groups_degree_level where degree_level IN ('
                for key in degreeFilter.keys():
                    if degreeFilter[key]:
                        tmp_sqlgetGroups += '%s,'
                        list_add_values.append(key)
                tmp_sqlgetGroups = tmp_sqlgetGroups[:-1] + '))'
            data = conn1.execute(tmp_sqlgetGroups, (request_body['email'], userid) + tuple(list_add_values))
            result = result_to_dict(data)
            self.write(result)

class getMyGroups(RequestHandler):
    def post(self):
        request_body = escape.json_decode(self.request.body)
        logged_in = GoogleLogin(request_body['token'], request_body['email'])
        if 'error' in logged_in:
            self.write(logged_in)
        else:
            userid = getUserIdByEmail(request_body['email'])
            data = conn1.execute(sqlgetMyGroups, (request_body['email'], userid))
            result = result_to_dict(data)
            self.write(result)

class getGroupMessages(RequestHandler):
    def post(self):
        request_body = escape.json_decode(self.request.body)
        logged_in = GoogleLogin(request_body['token'], request_body['email'])
        if 'error' in logged_in:
            self.write(logged_in)
        else:
            gid = request_body['groupid']
            userid = getUserIdByEmail(request_body['email'])
            data = conn1.execute(sqlgetGroupMessages, (gid))
            result = result_to_dict(data)
            self.write(result)

class joinGroup(RequestHandler):
    def post(self):
        request_body = escape.json_decode(self.request.body)
        logged_in = GoogleLogin(request_body['token'], request_body['email'])
        if 'error' in logged_in:
            self.write(logged_in)
        else:
            email = request_body["email"]
            userid = getUserIdByEmail(email)
            gid = request_body["gid"]
            data = conn1.execute(sqljoinGroup, (userid, gid))
            self.write({'msg': 'Successfully joined the group'})

class leaveGroup(RequestHandler):
    def post(self):
        request_body = escape.json_decode(self.request.body)
        logged_in = GoogleLogin(request_body['token'], request_body['email'])
        if 'error' in logged_in:
            self.write(logged_in)
        else:
            email = request_body["email"]
            userid = getUserIdByEmail(email)
            gid = request_body["gid"]
            if checkUserGroupMatch(userid, gid):
                data = conn1.execute(sqlleaveGroup, (userid, gid))
                self.write({'msg': 'Successfully left the group'})
            else:
                self.write({})

class getSports(RequestHandler):
    def post(self):
        request_body = escape.json_decode(self.request.body)
        logged_in = GoogleLogin(request_body['token'], request_body['email'])
        if 'error' in logged_in:
            self.write(logged_in)
        else:
            data = conn1.execute("SELECT name as value FROM sport")
            result = result_to_dict(data)
            self.write(result)

class addMessage(RequestHandler):
    def post(self):
        request_body = escape.json_decode(self.request.body)
        logged_in = GoogleLogin(request_body['token'], request_body['email'])
        if 'error' in logged_in:
            self.write(logged_in)
        else:
            userid = getUserIdByEmail(request_body["email"])
            gid = request_body['groupid']
            if checkUserGroupMatch(userid, gid):
                data = conn1.execute(sqlInsertMsg, (userid, request_body["groupid"], request_body["msg"]))
                self.write({})
            else:
                self.write({})

class getEvents(RequestHandler):
    def post(self):
        request_body = escape.json_decode(self.request.body)
        logged_in = GoogleLogin(request_body['token'], request_body['email'])
        if 'error' in logged_in:
            self.write(logged_in)
        else:
            gid = request_body["gid"]
            userid = getUserIdByEmail(request_body['email'])
            if checkUserGroupMatch(userid, gid):
                data = conn1.execute(sqlEvents, (gid))
                result = result_to_dict(data)
                self.write(result)
            else:
                self.write({})

class getLocations(RequestHandler):
    def post(self):
        request_body = escape.json_decode(self.request.body)
        logged_in = GoogleLogin(request_body['token'], request_body['email'])
        if 'error' in logged_in:
            self.write(logged_in)
        else:
            data = conn1.execute("SELECT name AS value FROM location")
            result = result_to_dict(data)
            self.write(result)

class createEvent(RequestHandler):
    def post(self):
        request_body = escape.json_decode(self.request.body)
        logged_in = GoogleLogin(request_body['token'], request_body['email'])
        if 'error' in logged_in:
            self.write(logged_in)
        else:
            userid = getUserIdByEmail(request_body["email"])
            eventName = request_body["eventName"]
            eventLocation = request_body["eventLocation"]
            eventTime = request_body["time"]
            recurrency = request_body["recurrency"]
            gid = request_body["gid"]
            lid = getLocationIdByName(eventLocation)
            userid = getUserIdByEmail(request_body['email'])
            if checkUserGroupMatch(userid, gid):
                data = conn1.execute(sqlcreateEvent, (eventName, recurrency, eventTime, lid, userid, gid))
                self.write({'msg': 'Successfully created an event'})
            else:
                self.write({})

class getUsers(RequestHandler):
    def post(self):
        request_body = escape.json_decode(self.request.body)
        logged_in = GoogleLogin(request_body['token'], request_body['email'])
        if 'error' in logged_in:
            self.write(logged_in)
        else:
            gid = request_body["gid"]
            userid = getUserIdByEmail(request_body['email'])
            if checkUserGroupMatch(userid, gid):
                data = conn1.execute(sqlGetUsersPerGroup, (gid))
                result = result_to_dict(data)
                self.write(result)
            else:
                self.write({})

if __name__ == "__main__":
    handler_mapping = [
                       (r'/registerWithImage$', registerWithImage),
                       (r'/login$', login),
                       (r'/getUserProfile$', getUserProfile),
                       (r'/getGroups$', getGroups),
                       (r'/joinGroup$', joinGroup),
                       (r'/leaveGroup$', leaveGroup),
                       (r'/getMyGroups$', getMyGroups),
                       (r'/getGroupMessages$', getGroupMessages),
                       (r'/getSports$', getSports),
                       (r'/addGroupWithImage$', addGroupWithImage),
                       (r'/addMessage$', addMessage),
                       (r'/www/(.*)', StaticFileHandler, {'path': './www'}),
                       (r'/getEvents$', getEvents),
                       (r'/getLocations$', getLocations),
                       (r'/createEvent$', createEvent),
                       (r'/getUsers$', getUsers)
                      ]
    application = Application(handler_mapping)
    application.listen(7778)
    IOLoop.current().start()