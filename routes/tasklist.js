const TaskDao = require("../models/TaskDao");

class TaskList {
    /**
     * Handles the various APIs for displaying and managing tasks
     * @param {TaskDao} taskDao
     */
    constructor(taskDao) {
        this.taskDao = taskDao;
    }

    async addTask(req, res) {
        const item = req.body;

        await this.taskDao.addItem(item);
        res.redirect("/");
    }

    async completeTask(req, res) {
        const completedTasks = Object.keys(req.body);
        const tasks = [];

        completedTasks.forEach(task => {
            tasks.push(this.taskDao.updateItem(task));
        });

        await Promise.all(tasks);

        res.redirect("/");
    }

    async showTasks(req, res) {
        const querySpec = {
            query: "SELECT * FROM root r ORDER BY r.grade ASC",
        };
        await this.handleTasks(req, res, querySpec);
    }

    // Add a new method to handle the search request
    async searchTasks(req, res) {
        const kanjiToSearch = req.body.kanji;
        const gradeToSearch = parseInt(req.body.grade, 10);
        const strokeCountToSearch = parseInt(req.body.stroke_count, 10);
        const meaningsToSearch = req.body.meanings;
        const kunReadingsToSearch = req.body.kun_readings;
        const onReadingsToSearch = req.body.on_readings;
        const nameReadingsToSearch = req.body.name_readings;
        const jlptToSearch = parseInt(req.body.jlpt, 10);

        let query = "SELECT * FROM root r WHERE 1=1"; // Start with a base query

        // Check if the user entered a kanji, then add the condition to the query
        if (kanjiToSearch) {
            query += ` AND CONTAINS(r.kanji, @kanjiParam)`;
        }

        // Check if the user entered a grade, then add the condition to the query
        if (!isNaN(gradeToSearch)) {
            query += ` AND r.grade = @gradeParam`;
        }

        // Add similar conditions for other search criteria
        if (!isNaN(strokeCountToSearch)) {
            query += ` AND r.stroke_count = @strokeCountParam`;
        }

        if (meaningsToSearch) {
            query += ` AND ARRAY_CONTAINS(r.meanings, @meaningsParam)`;
        }

        if (kunReadingsToSearch) {
            query += ` AND ARRAY_CONTAINS(r.kun_readings, @kunReadingsParam)`;
        }

        if (onReadingsToSearch) {
            query += ` AND ARRAY_CONTAINS(r.on_readings, @onReadingsParam)`;
        }

        if (nameReadingsToSearch) {
            query += ` AND ARRAY_CONTAINS(r.name_readings, @nameReadingsParam)`;
        }

        if (!isNaN(jlptToSearch)) {
            query += ` AND r.jlpt = @jlptParam`;
        }


        // Handle other search criteria (Meanings, Kun Readings, On Readings, Name Readings, and JLPT Level)
        // Add conditions for each search box similar to above.

        const querySpec = {
            query,
            parameters: [
                {
                    name: "@kanjiParam",
                    value: kanjiToSearch
                },
                {
                    name: "@gradeParam",
                    value: gradeToSearch
                },
                {
                    name: "@strokeCountParam",
                    value: strokeCountToSearch
                },
                {
                    name: "@meaningsParam",
                    value: meaningsToSearch
                },
                {
                    name: "@kunReadingsParam",
                    value: kunReadingsToSearch
                },
                {
                    name: "@onReadingsParam",
                    value: onReadingsToSearch
                },
                {
                    name: "@nameReadingsParam",
                    value: nameReadingsToSearch
                },
                {
                    name: "@jlptParam",
                    value: jlptToSearch
                }
                // Add parameters for other search criteria as needed
            ]
        };

        await this.handleTasks(req, res, querySpec, kanjiToSearch, gradeToSearch, strokeCountToSearch, meaningsToSearch, kunReadingsToSearch, onReadingsToSearch, nameReadingsToSearch, jlptToSearch);
    }

    async handleTasks(req, res, querySpec, kanjiValue = "", gradeValue = "", strokeCountValue="", meaningsValue="", kunReadingsValue="", onReadingsValue="", nameReadingsValue="", jlptValue="") {
        const items = await this.taskDao.find(querySpec);
        res.render("index", {
            title: "Adrian's Kanji List",
            tasks: items,
            kanjiValue,
            gradeValue,
            strokeCountValue,
            meaningsValue,
            kunReadingsValue,
            onReadingsValue,
            nameReadingsValue,
            jlptValue,
        });
    }

}

module.exports = TaskList;