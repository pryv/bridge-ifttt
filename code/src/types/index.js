// @flow


export type Credentials = {
  username: string,
  urlEndpoint: string,
  pryvToken: string,
  id: string, // IFTTT id: username for old, urlEndpoint for new
};

export type Stream = {
  id: string,
  name: string,
  children: Array<Stream>
};

export type PryvConnection = {
  username: string,
  urlEndpoint: string,
  pryvToken: string,
  oauth: string,
  auth: string,
};

export type Event = {
  id: string,
};

export type Attachment = {
  id: string,
  readToken: string,
};