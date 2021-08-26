import path from 'path';

export default () => {
    return function renderTemplate(err, req, res, next) {
        res.render(path.join(__dirname, '..', 'views/pages/error.nunj'), (err, html) => {
            if (err) {
                next(err);
            }
            res.status(404).send(html);
        });
    }
};
