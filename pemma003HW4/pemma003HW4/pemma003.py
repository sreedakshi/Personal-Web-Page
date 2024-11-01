#!/usr/bin/env python3
# See https://docs.python.org/3.2/library/socket.html
# for a decscription of python socket and its parameters
import socket

#add the following
import os
import stat
import sys
import urllib.parse
import datetime

from threading import Thread
from argparse import ArgumentParser

BUFSIZE = 4096

#add the following constants
CRLF = '\r\n'
METHOD_NOT_ALLOWED = 'HTTP/1.1 405 METHOD NOT ALLOWED{}Allow: GET, HEAD, POST {}Connection: close{}{}'.format(CRLF, CRLF, CRLF, CRLF)
OK = 'HTTP/1.1 200 OK{}{}{}'.format(CRLF, CRLF, CRLF) # response for successful head request
NOT_FOUND = 'HTTP/1.1 404 NOT FOUND{}Connection: close{}{}'.format(CRLF, CRLF, CRLF)
FORBIDDEN = 'HTTP/1.1 403 FORBIDDEN{}Connection: close{}{}'.format(CRLF, CRLF, CRLF)
MOVED_PERMANENTLY = 'HTTP/1.1 301 MOVED PERMANENTLY{}Location: https://www.cs.umn.edu/{}Connection: close{}{}'.format(CRLF, CRLF, CRLF, CRLF)

# helper function used by serve to get contents of files it ships back to browser
# in response to GET requests
def get_content(fname):
    with open(fname, 'r') as f:
        return f.read()

def get_media_contents(fname):
      with open(fname, 'rb') as f:
        return f.read()

#check permissions - used to check permissions on files - returns True or False
def check_perms(resource):
    """Returns True is resource has read permissions set on 'others'"""
    stmode = os.stat(resource).st_mode
    return (getattr(stat, 'S_IROTH') & stmode) > 0

#refactored out, this client talk is no longer used
def client_talk(client_sock, client_addr):
    print('talking to {}'.format(client_addr))
    data = client_sock.recv(BUFSIZE)
    while data:
      print(data.decode('utf-8'))
      data = client_sock.recv(BUFSIZE)

    # clean up
    client_sock.shutdown(1)
    client_sock.close()
    print('connection closed.')

class HTTP_HeadServer: # refactored version of EchoServer
  def __init__(self, host, port):
    print("Server")
    print('listening on port {}'.format(port))
    self.host = host
    self.port = port

    self.setup_socket()

    self.accept()

    self.sock.shutdown()
    self.sock.close()

  def setup_socket(self):
    self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    self.sock.bind((self.host, self.port))
    self.sock.listen(128)

  def accept(self):
    while True:
      (client, address) = self.sock.accept()
      # th = Thread(target=client_talk, args=(client, address))
      th = Thread(target=self.accept_request, args=(client, address))
      th.start()

  def accept_request(self,client_sock, client_addr):
      print("accept request")
      data = client_sock.recv(BUFSIZE)
      req = data.decode('utf-8') # returns a string
      response = self.process_request(req) #returns a string
      #once we get a response, we chop it into utf encoded bytes
      #and send it (like EchoClient)
      #client_sock.send(bytes(response, 'utf-8'))

      client_sock.send(response)

      #clean up the connection to the client
      #but leave the server socket for receiving requests open
      client_sock.shutdown(1)
      client_sock.close()
      
  #add a method to process requests
  def process_request(self,request):
    print('######\nREQUEST:\n{}######'.format(request))
    linelist = request.strip().split(CRLF)
    reqline = linelist[0]
    rlwords = reqline.split()
    if len(rlwords) == 0:
        return ''

    if rlwords[0] == 'HEAD':
        resource = rlwords[1][1:] # skip beginning /
        return self.head_request(resource)
    elif rlwords[0] == 'GET':
        resource = rlwords[1][1:]
        return self.get_request(resource)
        ## return self.get_request(resource, linelist)
    elif rlwords[0] == 'POST':
        print('at process request: first line have these:', reqline)
        resource = rlwords[1][1:]
        return self.post_request(resource, linelist) 
    else:
        return METHOD_NOT_ALLOWED # HTTP REQUEST METHOD NOT KNOWN OR IMPLEMENTED

  def head_request(self, resource):
      """Handles HEAD requests."""
      print("HEAD request:\n", resource)
      print("Serving head requests")
      path = os.path.join('.', resource) # look in directory
      # where server is running
      if resource == 'csumn':
          ret = MOVED_PERMANENTLY
      elif not os.path.exists(resource):
          ret = NOT_FOUND
      elif not check_perms(resource):
          ret = FORBIDDEN
      else:
          ret = OK # for head requests
      return ret
       
  def get_request(self, resource):
      """Handles GET requests."""
      print("GET request:\n", resource)
      print("Serving get requests")
      if ("redirect" in resource):
          header = 'HTTP/1.1 307 Temporary Redirect\n'
          content = resource.split("=")
          query = content[1]
          print(query)
          header += 'Location: https://www.youtube.com/results?search_query=' + query
          result = bytes(header, 'utf-8')
          return result
      else:
          if not os.path.exists(resource):
              header = NOT_FOUND
              print(notfound)
              content = get_content('404.html')
              header += content
              result = bytes(header, 'utf-8')
              return result
          elif not check_perms(resource):
              header = FORBIDDEN
              print(forbidden)
              content = get_content('403.html')
              header += content
              result = bytes(header, 'utf-8')
              return result
          content = resource.split()
          fname = content[0].strip("/")
          filetype = fname.split(".")
          header = 'HTTP/1.1 200 OK\n'
          if (filetype[1] == "html"):
              content = get_content(fname)
              header += 'Content-Type:text/html\n\n'
              header += content
              result = bytes(header, 'utf-8')
              return result
          elif (filetype[1] == "css"):
              content = get_content(fname)
              header += 'Content-Type:text/html\n\n'
              header += content
              result = bytes(header, 'utf-8')
              return result
          elif (filetype[1] == "js"): 
              content = get_content(fname)
              header += 'Content-Type:text/html\n\n'
              header += content
              result = bytes(header, 'utf-8')
              return result
          elif (filetype[1] == "png"): # this is for image files to be read 
              header += 'Content-Type:image/png\n\n'
              result = bytes(header,'utf-8')
              result += get_media_contents(fname)
              return result
          elif(filetype[1] == "mp3"): # this is for mp3 files to be read
              header += 'Content-Type:audio/mpeg\n\n'
              result = bytes(header,'utf-8')
              result += get_media_contents(fname)
              return result
    
  def post_request(self, request, linelist):
      """Handles POST requests."""
      print("POST request:\n", request, "\ndata:\n", linelist)
      print("Serving post requests")
      topars = linelist[-1]
      values = map(lambda x: x.split('='), topars.split('&'))
      HHEAD = "<!DOCTYPE HTML><html><head></head><body><table>" # html prior to table
      HTAIL = "</table></body></html>" # html for after table
      html = HHEAD + ''.join(map(lambda r: '<tr>' + '<td>' + r[0] +
                                 '</td>' + '<td>' + urllib.parse.unquote(r[1])
                                 + '</td>' + '</tr>', values)
      ) + HTAIL
      r = OK + html
      return bytes(r, 'utf-8') #got part of this code from office hours

# out of method def
def parse_args():
  parser = ArgumentParser()
  parser.add_argument('--host', type=str, default='localhost',
                      help='specify a host to operate on (default: localhost)')
  parser.add_argument('-p', '--port', type=int, default=9001,
                      help='specify a port to operate on (default: 900)')
  args = parser.parse_args()
  return (args.host, args.port)


if __name__ == '__main__':
  (host, port) = parse_args()
  HTTP_HeadServer(host, port) #formerly echoserver
