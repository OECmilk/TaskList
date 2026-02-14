-- 1. statusカラムの型をbooleanからtextに変更し、データを移行
ALTER TABLE tasks 
ALTER COLUMN status TYPE text 
USING CASE 
    WHEN status = true THEN '完了' 
    ELSE '未着手' 
END;

-- 2. チェック制約を追加して、許可された値のみを制限
ALTER TABLE tasks 
ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('未着手', '処理中', '保留', '完了'));

-- 3. デフォルト値を '未着手' に設定
ALTER TABLE tasks 
ALTER COLUMN status SET DEFAULT '未着手';
