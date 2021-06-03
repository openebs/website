import React from 'react';
import useStyles from './styles';
import Header from '../../components/Header';

const Scaffold: React.FC = ({ children }) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <header className={classes.header}>
                <Header />
            </header>
            <main className={classes.content}>{children}</main>
            
        </div>
    );
};

export default Scaffold;