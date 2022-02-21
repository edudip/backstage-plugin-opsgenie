import React from 'react';
import Moment from 'react-moment';
import 'moment-timezone';

export const NiceDate = ({ datetime }: {datetime: string}) => {
    const date = new Date(datetime)
    const now = Date.now()

    if(now - 1000*60*60*24 < date.getTime()){
        return <Moment fromNow>{ date.toUTCString() }</Moment>
    } else {
        return <Moment format="DD/MM/YYYY hh:mm">{ date.toUTCString() }</Moment>
    }

};
