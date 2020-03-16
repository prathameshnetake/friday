import React from 'react';
import { AppBar, makeStyles, Toolbar, Paper, Typography } from '@material-ui/core';
import {grey} from '@material-ui/core/colors'

const styles = makeStyles({
  root: {
    backgroundColor: grey[800],
    height: '100vh'
  },
  appbar: {
    backgroundColor: grey[900]
  }
})

export default () => {
  const classes = styles();
  return (
    <div className={classes.root}>
      <AppBar position='static' className={classes.appbar}>
        <Toolbar>
          some text
        </Toolbar>
      </AppBar>
      <div>
        <Typography>ROOM LIST</Typography>
      </div>
    </div>
  )
}